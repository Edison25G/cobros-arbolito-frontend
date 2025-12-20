import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Injectable({
	providedIn: 'root',
})
export class ComprobanteService {
	constructor() {}

	generarRecibo(socio: any, items: any[], total: number, nroTicket: string) {
		const doc = new jsPDF();

		// ==========================================
		// 1. ENCABEZADO (Logo y Títulos)
		// ==========================================
		doc.setFontSize(16);
		doc.text('JUNTA DE RIEGO Y DRENAJE', 105, 15, { align: 'center' });

		doc.setFontSize(20);
		doc.setFont('helvetica', 'bold');
		doc.text('"EL ARBOLITO"', 105, 24, { align: 'center' });

		doc.setFontSize(9);
		doc.setFont('helvetica', 'normal');
		doc.text('RUC: 0590000000001 | Barrio Central, Pujilí', 105, 30, { align: 'center' });
		doc.text('Tel: 0988789904 | Email: contacto@el-arbolito.com', 105, 34, { align: 'center' });

		// Línea separadora
		doc.setLineWidth(0.5);
		doc.line(10, 38, 200, 38);

		// ==========================================
		// 2. DATOS DEL TICKET (Bloque Superior Derecho)
		// ==========================================
		// Fecha corta para evitar desbordes
		const fecha = new Date().toLocaleDateString('es-EC', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
		});

		// Movemos la fecha ARRIBA del recuadro del ticket para que no estorbe
		doc.setFontSize(9);
		doc.setFont('helvetica', 'normal');
		doc.text(`Fecha de Emisión: ${fecha}`, 195, 46, { align: 'right' });

		// CAJA GRIS PARA EL NÚMERO DE TICKET
		doc.setFillColor(240, 240, 240); // Gris claro
		doc.rect(135, 50, 60, 15, 'F'); // Bajamos la caja a Y=50

		doc.setFontSize(10);
		doc.setFont('helvetica', 'bold');
		doc.text(`N° COMPROBANTE`, 165, 55, { align: 'center' }); // Centrado en la caja

		doc.setFontSize(12);
		doc.setTextColor(0, 0, 0);
		doc.text(`${nroTicket}`, 165, 62, { align: 'center' });

		// ==========================================
		// 3. DATOS DEL CLIENTE (Bloque Inferior Izquierdo)
		// ==========================================
		// ✅ CORRECCIÓN CLAVE: Bajamos todo este bloque a Y=75
		// Así es imposible que choque con el ticket o la fecha de arriba
		const startY_Socio = 75;

		doc.setFontSize(10);
		doc.setFont('helvetica', 'bold');
		doc.text('DATOS DEL CLIENTE:', 14, startY_Socio);

		doc.setFont('helvetica', 'normal');
		doc.text(`Cliente:   ${socio.nombres} ${socio.apellidos}`, 14, startY_Socio + 6);
		doc.text(`C.I. / RUC: ${socio.cedula}`, 14, startY_Socio + 11);
		doc.text(`Dirección: ${socio.barrio}`, 14, startY_Socio + 16);

		// ==========================================
		// 4. TABLA DE DETALLES
		// ==========================================
		const cuerpoTabla = items.map((item) => [
			item.concepto,
			item.tipo,
			item.vencimiento || '-',
			`$${item.monto.toFixed(2)}`,
		]);

		autoTable(doc, {
			startY: startY_Socio + 22, // La tabla empieza en Y=97 aprox
			head: [['Descripción / Concepto', 'Tipo', 'Vencimiento', 'Valor']],
			body: cuerpoTabla,
			theme: 'grid',
			headStyles: {
				fillColor: [22, 163, 74],
				textColor: 255,
				fontStyle: 'bold',
				halign: 'center',
			},
			styles: { fontSize: 9, cellPadding: 3 },
			columnStyles: {
				0: { cellWidth: 90 },
				3: { halign: 'right', fontStyle: 'bold' },
			},
		});

		// ==========================================
		// 5. TOTALES
		// ==========================================
		const finalY = (doc as any).lastAutoTable.finalY + 10;

		doc.setFontSize(12);
		doc.setFont('helvetica', 'bold');

		// Total alineado a la derecha
		doc.text(`TOTAL PAGADO: $${total.toFixed(2)}`, 190, finalY, { align: 'right' });

		// ==========================================
		// 6. FIRMAS
		// ==========================================
		const yFirmas = finalY + 35;

		doc.setLineWidth(0.5);
		doc.line(30, yFirmas, 80, yFirmas); // Línea Tesorero
		doc.line(130, yFirmas, 180, yFirmas); // Línea Cliente

		doc.setFontSize(8);
		doc.setFont('helvetica', 'normal');
		doc.text('TESORERO/RECAUDADOR', 55, yFirmas + 5, { align: 'center' });
		doc.text('RECIBÍ CONFORME', 155, yFirmas + 5, { align: 'center' });

		// ==========================================
		// 7. MOSTRAR PDF
		// ==========================================
		doc.output('dataurlnewwindow');
	}
}
