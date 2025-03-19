export default function delay(delay: number) {
  return new Promise((resolve) => setTimeout(resolve, delay));
}
