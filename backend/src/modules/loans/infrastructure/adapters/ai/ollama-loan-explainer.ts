import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatOllama } from '@langchain/ollama';
import { HumanMessage } from '@langchain/core/messages';
import { ILoanExplainer, LoanExplainInput } from '../../../domain/ports/loan-explainer.port';

const COP = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

@Injectable()
export class OllamaLoanExplainer implements ILoanExplainer {
  private llm: ChatOllama | null = null;

  constructor(private readonly config: ConfigService) {}

  private getLlm(): ChatOllama {
    if (!this.llm) {
      const baseUrl =
        this.config.get<string>('OLLAMA_HOST') ??
        process.env['OLLAMA_HOST'] ??
        'http://localhost:11434';
      this.llm = new ChatOllama({
        baseUrl,
        model: 'llama3.2:1b',
        temperature: 0.7,
        numPredict: 1024,
      });
    }
    return this.llm;
  }

  async explain(input: LoanExplainInput): Promise<string> {
    const totalPaid = input.monthlyPayment * input.termInYears * 12;
    const interestPct = ((input.totalInterest / input.loanAmount) * 100).toFixed(1);
    const ratePct = (input.annualInterestRate * 100).toFixed(2);

    const prompt = `Eres un amigo de confianza explicándole a alguien que nunca ha pedido un crédito cómo funciona esta simulación de vivienda. Habla como si le explicaras a tu mamá o a alguien que no sabe nada de finanzas. Nada de términos técnicos, nada de siglas raras. Todo en pesos colombianos (COP) y en palabras del día a día.

Datos de la simulación:
- La casa cuesta: ${COP(input.propertyValue)}
- Lo que paga de entrada (cuota inicial): ${COP(input.downPayment)} (el ${((input.downPayment / input.propertyValue) * 100).toFixed(1)}% del valor de la casa)
- Lo que le presta el banco: ${COP(input.loanAmount)}
- Tiempo para pagarlo: ${input.termInYears} años (${input.termInYears * 12} pagos mensuales)
- Interés anual: ${ratePct}%
- Lo que paga cada mes: ${COP(input.monthlyPayment)}
- Total que pagará al final: ${COP(totalPaid)}
- De ese total, cuánto son intereses (lo extra que cobra el banco): ${COP(input.totalInterest)} (${interestPct}% de lo prestado)
- Estado de la solicitud: ${input.status}${input.rejectionReason ? `\n- Motivo: ${input.rejectionReason}` : ''}

Escribe la explicación en español con exactamente estas 4 secciones. Usa los encabezados tal como están escritos abajo:

**¿Cuánto pagas cada mes y de dónde sale ese número?**
[Explica la cuota mensual en palabras simples. Di que ese dinero cubre dos cosas: una parte de la deuda y una parte de lo que cobra el banco por prestarte el dinero. Usa una analogía cotidiana si ayuda.]

**¿Cuánto le terminas pagando al banco en total?**
[Compara el monto prestado con el total a pagar al final. Explica en palabras sencillas cuánto extra cobra el banco. Sé honesto, sin tecnicismos.]

**¿Qué pasa si pagas más de la cuota mensual?**
[Explica de forma muy simple que si algún mes pagas más, eso reduce la deuda más rápido, el banco cobra menos intereses, y puedes terminar de pagar antes o pagar menos cada mes. Sin jerga.]

**¿Esta opción te conviene?**
[Da una opinión honesta y humana según el estado (${input.status}). Si fue rechazado, explica en palabras simples por qué y qué podría cambiar. Si fue aprobado, di si la cuota mensual parece manejable o si es una carga pesada para el bolsillo.]`;

    const llm = this.getLlm();
    try {
      const response = await llm.invoke([new HumanMessage(prompt)]);
      const content = response.content;
      return typeof content === 'string' ? content : 'No se pudo generar la explicación.';
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? '';
      if (msg.includes('ECONNREFUSED') || msg.includes('fetch failed')) {
        throw new ServiceUnavailableException('Ollama no disponible. Asegúrate de tener Ollama corriendo en ' + (this.config.get<string>('OLLAMA_HOST') ?? 'http://localhost:11434'));
      }
      throw err;
    }
  }
}
