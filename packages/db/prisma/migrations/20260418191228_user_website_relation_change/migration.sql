/*
  Warnings:

  - You are about to drop the `_UserToWebsite` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `user_id` to the `Website` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_UserToWebsite" DROP CONSTRAINT "_UserToWebsite_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserToWebsite" DROP CONSTRAINT "_UserToWebsite_B_fkey";

-- AlterTable
ALTER TABLE "Website" ADD COLUMN     "user_id" TEXT NOT NULL;

-- DropTable
DROP TABLE "_UserToWebsite";

-- AddForeignKey
ALTER TABLE "Website" ADD CONSTRAINT "Website_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
