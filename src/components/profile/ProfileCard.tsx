
import { Card } from "@/components/ui/card";
import { ProfileType } from "@/hooks/useUserProfile";

interface ProfileCardProps {
  profile: ProfileType | null;
  onProfileUpdate: () => void;
}

export const ProfileCard = ({ profile, onProfileUpdate }: ProfileCardProps) => {
  return (
    <div className="flex flex-col items-center">
      <Card className="w-full p-6 bg-gradient-to-b from-sergen-100 to-sergen-50">
        <h2 className="text-2xl font-semibold text-center">{profile?.business_name || "Empresa"}</h2>
      </Card>
    </div>
  );
};
