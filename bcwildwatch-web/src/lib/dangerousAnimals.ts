const DANGEROUS = ['snake', 'cobra', 'adder', 'bee', 'wasp', 'hornet', 'stray dog', 'dog', 'scorpion', 'spider'];
export function isDangerous(animalName: string | null | undefined): boolean {
  if (!animalName) return false;
  const n = animalName.toLowerCase();
  return DANGEROUS.some((d) => n.includes(d));
}
