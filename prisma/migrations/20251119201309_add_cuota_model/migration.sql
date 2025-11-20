-- CreateTable
CREATE TABLE "Cuota" (
    "id" SERIAL NOT NULL,
    "prestamoId" INTEGER NOT NULL,
    "numeroCuota" INTEGER NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "capital" DOUBLE PRECISION NOT NULL,
    "interes" DOUBLE PRECISION NOT NULL,
    "fechaVencimiento" TIMESTAMP(3) NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'Pendiente',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cuota_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Cuota" ADD CONSTRAINT "Cuota_prestamoId_fkey" FOREIGN KEY ("prestamoId") REFERENCES "Prestamo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
