import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScoreGuide } from "@/components/score-guide";

type RulesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function RulesDialog({ open, onOpenChange }: RulesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>딕싯 점수</DialogTitle>
          <DialogDescription>
            공식 규칙 그대로입니다. 헷갈리면 이 표만 보면 됩니다.
          </DialogDescription>
        </DialogHeader>
        <ScoreGuide detailed framed={false} />
      </DialogContent>
    </Dialog>
  );
}