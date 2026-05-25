/**
 * Доменная сущность типа выполняемых работ.
 * Представляет собой справочную запись о конкретном виде строительных работ.
 */
export class WorkType {
  /**
   * Создает экземпляр WorkType.
   * 
   * @param id - Уникальный идентификатор типа работ (UUID)
   * @param title - Название типа работ (например, "Укладка кирпича")
   * @param unit - Единица измерения выполненного объема (например, "м3", "м2", "шт")
   * @throws {Error} Если название или единица измерения пустые
   */
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly unit: string,
  ) {
    // Валидация входных доменных данных для обеспечения согласованности
    if (!title || title.trim().length === 0) {
      throw new Error('WorkType title cannot be empty');
    }
    if (!unit || unit.trim().length === 0) {
      throw new Error('WorkType unit cannot be empty');
    }
  }
}

