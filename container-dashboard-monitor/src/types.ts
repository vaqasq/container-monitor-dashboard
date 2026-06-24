export interface ContainerData {
    name: string,
    status: string,
    timestamp: string,
    cpu_usage: number,
    memory_usage: number,
}

export interface HistoryData {
    name: string,
    timestamp: string,
    cpu_usage: number,
    memory_usage: number,
}