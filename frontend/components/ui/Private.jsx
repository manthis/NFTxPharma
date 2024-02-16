import { useAuthContext } from "@/components/auth/AuthContext";
import withAuthentication from "@/components/auth/withAuthentication";
import { PublicSection } from "@/components/ui/Public";

const PrivateSection = () => {
    const user = useAuthContext();

    return (
        <div>
            <h1>Private</h1>
        </div>
    );
};

export default withAuthentication(PrivateSection, PublicSection);
