export const medicinePriceTable = {
  dipirona: 12.90,
  paracetamol: 15.50,
  ibuprofeno: 22.30,
  amoxicilina: 48.90,
  loratadina: 18.75
};

export function getMedicinePrice(medicineName) {
  if (!medicineName) return 19.90;

  const key = medicineName.trim().toLowerCase();

  return medicinePriceTable[key] ?? generateRandomPrice();
}

function generateRandomPrice() {
  const min = 10;
  const max = 60;
  return Number((Math.random() * (max - min) + min).toFixed(2));
}
