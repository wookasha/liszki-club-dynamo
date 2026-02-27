import { Link } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";

interface PrivacyClauseProps {
  accepted: boolean;
  onChange: (checked: boolean) => void;
}

const PrivacyClause = ({ accepted, onChange }: PrivacyClauseProps) => {
  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground leading-relaxed">
        Administratorem Twoich danych osobowych jest LKS Liszczanka Liszki. Dane będą przetwarzane
        w celu odpowiedzi na Twoje zgłoszenie. Przysługuje Ci prawo dostępu do danych, ich
        sprostowania, usunięcia oraz wniesienia sprzeciwu. Więcej informacji w{" "}
        <Link to="/polityka-prywatnosci" className="text-primary hover:underline font-medium" target="_blank">
          Polityce Prywatności
        </Link>.
      </p>
      <label className="flex items-start gap-2 cursor-pointer">
        <Checkbox
          checked={accepted}
          onCheckedChange={(checked) => onChange(checked === true)}
          className="mt-0.5"
        />
        <span className="text-xs text-muted-foreground select-none">
          Zapoznałem/am się z klauzulą informacyjną i akceptuję{" "}
          <Link to="/polityka-prywatnosci" className="text-primary hover:underline" target="_blank">
            Politykę Prywatności
          </Link>.
        </span>
      </label>
    </div>
  );
};

export default PrivacyClause;
