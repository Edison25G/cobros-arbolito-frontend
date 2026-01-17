import { Injectable } from '@angular/core'; // <--- ESTA ES LA LÍNEA QUE FALTA
import jsPDF from 'jspdf';
import JsBarcode from 'jsbarcode';

@Injectable({
	providedIn: 'root',
})
export class ComprobanteService {
	generarTicketProfesional(socio: any, factura: any, pagos: any[]) {
		// Definimos el tamaño del ticket: 80mm de ancho y altura dinámica
		const doc = new jsPDF({
			unit: 'mm',
			format: [80, 160],
		});

		// --- 1. DATOS DEL EMISOR (JUNTA) ---
		doc.setFontSize(10);
		doc.setFont('helvetica', 'bold');
		doc.text('JUNTA DE AGUA "EL ARBOLITO"', 40, 8, { align: 'center' });
		doc.setFontSize(7);
		doc.setFont('helvetica', 'normal');
		doc.text('RUC: 0591726951001', 40, 12, { align: 'center' });
		doc.text('Pujilí - Cotopaxi', 40, 15, { align: 'center' });
		doc.text('Obligado a Contabilidad: NO', 40, 18, { align: 'center' });
		doc.text('--------------------------------------------------', 40, 21, { align: 'center' });

		// --- 2. DATOS DE LA FACTURA ---
		doc.setFontSize(8);
		doc.setFont('helvetica', 'bold');
		doc.text(`FACTURA: 001-001-${factura.id.toString().padStart(9, '0')}`, 5, 26);
		doc.setFont('helvetica', 'normal');
		doc.text(`FECHA: ${new Date(factura.fecha_emision).toLocaleDateString()}`, 5, 30);

		// --- 3. DATOS DEL SOCIO ---
		doc.text(`SOCIO: ${socio.nombres} ${socio.apellidos}`, 5, 36);
		doc.text(`CÉDULA: ${socio.cedula}`, 5, 40);
		doc.text(`DIRECCIÓN: ${socio.direccion || 'S/N'}`, 5, 44);
		doc.text('--------------------------------------------------', 40, 48, { align: 'center' });

		// --- 4. DETALLE (TABLA) ---
		doc.setFont('helvetica', 'bold');
		doc.text('CONCEPTO', 5, 53);
		doc.text('TOTAL', 75, 53, { align: 'right' });
		doc.setFont('helvetica', 'normal');

		// Aquí el sistema diferencia si es medidor o acometida fija
		doc.text('Servicio de Agua Potable', 5, 58);
		doc.text(`$${factura.total.toFixed(2)}`, 75, 58, { align: 'right' });

		doc.text('--------------------------------------------------', 40, 64, { align: 'center' });

		// --- 5. TOTALES Y MÉTODOS DE PAGO ---
		doc.setFontSize(10);
		doc.setFont('helvetica', 'bold');
		doc.text('TOTAL PAGADO:', 5, 70);
		doc.text(`$${factura.total.toFixed(2)}`, 75, 70, { align: 'right' });

		// AQUÍ USAMOS LA VARIABLE 'pagos' PARA QUITAR EL ERROR
		doc.setFontSize(7);
		doc.setFont('helvetica', 'normal');
		let yPago = 74;
		pagos.forEach((p) => {
			doc.text(`PAGO: ${p.metodo} - $${p.monto.toFixed(2)}`, 5, yPago);
			yPago += 3;
		});
		// --- 6. DATOS SRI (LO MÁS IMPORTANTE) ---
		doc.setFontSize(6);
		doc.setFont('helvetica', 'normal');
		doc.text('CLAVE DE ACCESO / AUTORIZACIÓN:', 40, 78, { align: 'center' });
		doc.text(factura.clave_acceso_sri, 40, 81, { align: 'center' });

		// Generamos el Código de Barras dinámico
		const canvas = document.createElement('canvas');
		JsBarcode(canvas, factura.clave_acceso_sri, { format: 'CODE128', displayValue: false });
		const imgData = canvas.toDataURL('image/png');
		doc.addImage(imgData, 'PNG', 10, 83, 60, 10);

		doc.setFontSize(7);
		doc.text('Descargue su factura en: sri.gob.ec', 40, 98, { align: 'center' });

		// Abrir en ventana nueva para imprimir
		doc.output('dataurlnewwindow');
		return doc.output('bloburl');
	}
}
