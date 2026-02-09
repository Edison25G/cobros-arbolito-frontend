//src/app/core/interfaces/billing.interface.ts

export interface ItemPendienteDTO {
    id: number;
    fecha_emision: string; // "YYYY-MM-DD"
    concepto: string;
    saldo_pendiente: string; // Decimal as string from backend
    total_original: string; // Decimal as string from backend
    nombre_terreno: string;
    mes_facturado: string;
}

export interface EstadoCuentaDTO {
    socio_id: number;
    nombre_socio: string;
    identificacion: string;
    servicio_id: number;
    estado_servicio: string; // "ACTIVO" | "SUSPENDIDO"
    deuda_total: string; // Decimal as string
    items_pendientes: ItemPendienteDTO[];
}

export interface AbonoInput {
    socio_id: number;
    monto: number;
    metodo_pago: 'EFECTIVO' | 'TRANSFERENCIA' | 'CHEQUE';
    referencia?: string;
}

export interface AbonoOutput {
    pago_id: number;
    monto_abonado: number;
    saldo_restante_total: number;
    cuentas_afectadas: number;
    estado_servicio: string;
    mensaje: string;
}
