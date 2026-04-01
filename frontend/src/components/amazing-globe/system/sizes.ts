export const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
}

export const initSizes = (canvas: HTMLCanvasElement) => {
    sizes.width = canvas.clientWidth
    sizes.height = canvas.clientHeight
}
