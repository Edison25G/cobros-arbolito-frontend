// src/app/core/models/billing.models.ts

export enum EstadoServicio {
    ACTIVO = 'ACTIVO',
    SUSPENDIDO = 'SUSPENDIDO',
    PENDIENTE_RECONEXION = 'PENDIENTE_RECONEXION',
    INACTIVO = 'INACTIVO'
}

export type MetodoPago = 'EFECTIVO' | 'TRANSFERENCIA' | 'CHEQUE';

export interface DeudaItem {
    id: number;
    fecha_emision: string;
    concepto: string;
    // Django DecimalField returns string by default
    saldo_pendiente: string;
    total_original: string;

    // UX Fields
    nombre_terreno?: string;
    tiene_medidor?: boolean;
    detalle_consumo?: string;
    mes_facturado?: string;
    tipo_servicio?: string;
    periodo?: string;
}

export interface EstadoCuentaResponse {
    socio_id: number;
    nombre_socio: string;
    identificacion: string;

    servicio_id: number | null;
    estado_servicio: EstadoServicio | string;

    deuda_total: string; // Decimal as string

    items_pendientes: DeudaItem[];
}

export interface PagoRequest {
    socio_id: number;
    monto: string; // Send as string to preserve decimal precision
    metodo_pago: MetodoPago;
    referencia?: string;
}

export interface PagoResponse {
    pago_id: number;
    monto_abonado: string;
    saldo_restante_total: string;
    cuentas_afectadas: number;
    estado_servicio: string;
    mensaje: string;
}
