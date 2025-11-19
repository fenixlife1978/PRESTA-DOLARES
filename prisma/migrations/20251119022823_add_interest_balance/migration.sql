/*
  Warnings:

  - You are about to drop the column `fecha` on the `Prestamo` table. All the data in the column will be lost.
  - Added the required column `fechaOtorgamiento` to the `Prestamo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipoInteres` to the `Prestamo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipoPrestamo` to the `Prestamo` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Socio_cedula_key";

-- AlterTable
ALTER TABLE "Prestamo" DROP COLUMN "fecha",
ADD COLUMN     "esLibreAbono" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "fechaOtorgamiento" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "saldoInteres" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "tipoInteres" TEXT NOT NULL,
ADD COLUMN     "tipoPrestamo" TEXT NOT NULL,
ALTER COLUMN "interes" DROP NOT NULL,
ALTER COLUMN "cuotas" DROP NOT NULL,
ALTER COLUMN "estado" SET DEFAULT 'Activo';

-- AlterTable
ALTER TABLE "Socio" ALTER COLUMN "cedula" DROP NOT NULL;
