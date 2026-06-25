-- AddForeignKey
ALTER TABLE "Interview2" ADD CONSTRAINT "Interview2_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
