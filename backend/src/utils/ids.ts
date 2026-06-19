import crypto from "crypto";

export function orderId() {
  return `CH-${crypto.randomInt(10_000_000, 99_999_999)}`;
}

export function lineItemId() {
  return `line-${crypto.randomInt(1000, 9999)}`;
}
