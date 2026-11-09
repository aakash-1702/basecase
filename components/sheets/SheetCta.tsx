import { ArrowRight, Flame } from "lucide-react";
import Container from "@/components/shared/Container";

export default function SheetCta({
  onExpandAll,
  onReset,
}: {
  onExpandAll: () => void;
  onReset: () => void;
}) {
  return (
    <section className="border-t border-line py-16 md:py-20">
      <Container size="md" className="text-center">
        <span className="eyebrow justify-center">
          <Flame className="h-3 w-3" />
          Keep the momentum going
        </span>
        <h2 className="mt-4 font-display text-3xl tracking-tight text-fg sm:text-4xl lg:text-5xl">
          Consistency beats
          <br />
          <span className="text-gradient">talent, every time.</span>
        </h2>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button type="button" onClick={onExpandAll} className="btn btn-primary btn-lg">
            Expand all sections
            <ArrowRight className="h-4 w-4" />
          </button>
          <button type="button" onClick={onReset} className="btn btn-secondary btn-lg">
            Reset progress
          </button>
        </div>
      </Container>
    </section>
  );
}
