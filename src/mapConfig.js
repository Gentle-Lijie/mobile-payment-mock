const key = import.meta.env.VITE_GAODE_KEY || ''
const jsCode = import.meta.env.VITE_GAODE_JSCODE || ''
const serviceHost = import.meta.env.VITE_GAODE_SERVICE_HOST || ''
const rawFence = import.meta.env.VITE_GEOFENCE_COORDS || ''

export const gaodeKey = key
export const gaodeJsCode = jsCode
export const gaodeServiceHost = serviceHost

export const fenceCoords = rawFence
    .split(';')
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
        const [lng, lat] = p.split(',').map(Number)
        return { lng, lat }
    })
    .filter((p) => Number.isFinite(p.lng) && Number.isFinite(p.lat))

export function fenceCenter() {
    if (!fenceCoords.length) return { lng: 120.1551, lat: 30.2742 }
    const sum = fenceCoords.reduce(
        (acc, cur) => ({ lng: acc.lng + cur.lng, lat: acc.lat + cur.lat }),
        { lng: 0, lat: 0 }
    )
    return { lng: sum.lng / fenceCoords.length, lat: sum.lat / fenceCoords.length }
}
