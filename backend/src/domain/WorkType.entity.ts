export class WorkType {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly unit: string,
  ) {
    if (!title || title.trim().length === 0) {
      throw new Error('WorkType title cannot be empty');
    }
    if (!unit || unit.trim().length === 0) {
      throw new Error('WorkType unit cannot be empty');
    }
  }
}
