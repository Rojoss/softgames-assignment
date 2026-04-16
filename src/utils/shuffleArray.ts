/**
 * Returns a shuffled copy of the provided array using the Fisher-Yates algorithm.
 */
export function shuffleArray<ItemType>(items: readonly ItemType[]): ItemType[] {
  const shuffledItems = [...items];

  for (let index = shuffledItems.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const currentItem = shuffledItems[index];

    shuffledItems[index] = shuffledItems[swapIndex];
    shuffledItems[swapIndex] = currentItem;
  }

  return shuffledItems;
}
