
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { ProfileType } from "@/hooks/useUserProfile";

interface ProfileCardProps {
  profile: ProfileType | null;
  onProfileUpdate: () => void;
}

export const ProfileCard = ({ profile, onProfileUpdate }: ProfileCardProps) => {
  return (
    <div className="flex flex-col items-center">
      <Card className="w-72 h-72 overflow-hidden bg-gradient-to-b from-sergen-100 to-sergen-50">
        <div className="relative w-full h-full">
          <Avatar className="w-full h-full rounded-lg">
            <AvatarImage src={profile?.profile_image || ""} className="object-cover w-full h-full" />
            <AvatarFallback className="text-4xl w-full h-full">{profile?.business_name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
        </div>
      </Card>
      <h2 className="text-xl font-semibold mt-4 text-center">{profile?.business_name || "Empresa"}</h2>
    </div>
  );
};
