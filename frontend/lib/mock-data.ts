import { Order, UserProfile } from "@/lib/types";

export const demoUser: UserProfile = {
  id: "demo-user",
  name: "Aman Malhotra",
  email: "aman@customhub.com",
  avatar: "AM",
  role: "user",
  addresses: [
    {
      id: "addr-demo",
      fullName: "Aman Malhotra",
      phone: "+91 9876543210",
      line1: "221 CustomHub Studio Road",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560001"
    }
  ]
};

export const demoOrders: Order[] = [
  {
    id: "CH-DEMO-ORDER",
    createdAt: "2026-05-29T00:00:00.000Z",
    total: 0,
    status: "placed",
    items: [],
    shippingAddress: demoUser.addresses[0],
    paymentMethod: "Demo"
  }
];
