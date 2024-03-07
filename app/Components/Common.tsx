export const isEmpty = (data: any) => {
    return data === undefined || data === null || `${data}`.length == 0
}