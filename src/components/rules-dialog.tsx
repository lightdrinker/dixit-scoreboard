import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
            공식 규칙 그대로입니다. 30점에 먼저 도착한 사람이 이깁니다.
          </DialogDescription>
        </DialogHeader>
        <ol className="flex flex-col gap-4 text-sm leading-relaxed">
          <li>
            <p className="font-medium text-foreground">1. 스토리텔러</p>
            <p className="text-muted-foreground">
              카드 한 장을 고르고 힌트를 말합니다. 나머지는 그 힌트에 맞는
              카드를 한 장씩 냅니다.
            </p>
          </li>
          <li>
            <p className="font-medium text-foreground">2. 투표</p>
            <p className="text-muted-foreground">
              스토리텔러를 제외한 모두, 어느 장이 스토리텔러의 카드인지
              투표합니다. 자기 카드에는 투표할 수 없습니다.
            </p>
          </li>
          <li>
            <p className="font-medium text-foreground">3. 기본 점수</p>
            <p className="text-muted-foreground">
              전원 맞히거나 아무도 못 맞히면 스토리텔러는 0점, 나머지는
              각자 +2. 일부만 맞히면 스토리텔러와 맞힌 사람이 각자 +3.
            </p>
          </li>
          <li>
            <p className="font-medium text-foreground">4. 미끼 보너스</p>
            <p className="text-muted-foreground">
              스토리텔러가 아닌 사람은 자기 카드가 받은 표 1장당 +1.
            </p>
          </li>
          <li>
            <p className="font-medium text-foreground">3인 플레이</p>
            <p className="text-muted-foreground">
              스토리텔러를 제외한 사람은 카드를 2장씩 냅니다. 점수 계산은
              같고, 받은 표는 두 장을 합산하면 됩니다.
            </p>
          </li>
        </ol>
      </DialogContent>
    </Dialog>
  );
}
