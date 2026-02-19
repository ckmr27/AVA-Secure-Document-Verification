/*
  Warnings:

  - Added the required column `ipfsLink` to the `Certificate` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Certificate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "certCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fileHash" TEXT NOT NULL,
    "ipfsLink" TEXT NOT NULL,
    "uploadedBy" INTEGER NOT NULL,
    "institutionId" TEXT,
    CONSTRAINT "Certificate_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Certificate_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Certificate" ("certCode", "fileHash", "id", "institutionId", "title", "uploadedBy") SELECT "certCode", "fileHash", "id", "institutionId", "title", "uploadedBy" FROM "Certificate";
DROP TABLE "Certificate";
ALTER TABLE "new_Certificate" RENAME TO "Certificate";
CREATE UNIQUE INDEX "Certificate_certCode_key" ON "Certificate"("certCode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
