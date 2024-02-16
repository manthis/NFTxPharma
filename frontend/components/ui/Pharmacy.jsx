import withAuthentication from "@/components/auth/withAuthentication";
import { PublicSection } from "@/components/ui/Public";

export const Pharmacy = () => {
    return (
        <div>
            <h1>Pharmacy</h1>
        </div>
    );
};

export default withAuthentication(Pharmacy, PublicSection);
