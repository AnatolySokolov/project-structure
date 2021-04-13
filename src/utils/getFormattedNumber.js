export default function (number, divider) {
  const arr = String(number).split('');

  if (arr.length > 3 && arr.length <= 6) {
    arr.splice(-3, 0, divider);
  } else if (arr.length > 6) {
    arr.splice(-3, 0, divider);
    arr.splice(-7, 0, divider);
  }

  return `${arr.join('')}`;
}
