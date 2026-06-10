import { v4 as uuidv4 } from 'uuid';

export abstract class Entity<T> {
  protected props: T;

  protected constructor(props: T) {
    this.props = props;
  }

  protected static generateId(): string {
    return uuidv4();
  }

  toObject(): T {
    return this.props;
  }

  equals(entity: Entity<T>): boolean {
    if (entity === null || entity === undefined) {
      return false;
    }
    return JSON.stringify(this.props) === JSON.stringify(entity.props);
  }
}
