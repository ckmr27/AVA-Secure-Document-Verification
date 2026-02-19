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
    "studentName" TEXT,
    "degree" TEXT,
    "year" INTEGER,
    "blockchainTxHash" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Certificate_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Certificate_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Certificate" ("certCode", "createdAt", "fileHash", "id", "institutionId", "ipfsLink", "title", "updatedAt", "uploadedBy") SELECT "certCode", "createdAt", "fileHash", "id", "institutionId", "ipfsLink", "title", "updatedAt", "uploadedBy" FROM "Certificate";
DROP TABLE "Certificate";
ALTER TABLE "new_Certificate" RENAME TO "Certificate";
CREATE UNIQUE INDEX "Certificate_certCode_key" ON "Certificate"("certCode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
