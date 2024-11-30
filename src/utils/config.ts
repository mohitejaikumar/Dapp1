import { PinataSDK } from "pinata"

export const pinata = new PinataSDK({
    pinataJwt: `${import.meta.env.VITE_JWT_TOKEN}`,
    pinataGateway: `${import.meta.env.VITE_GATEWAY}`,
})
console.log(import.meta.env.VITE_GATEWAY)
