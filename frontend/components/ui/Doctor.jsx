import withAuthentication from "@/components/auth/withAuthentication";
import { PublicSection } from "@/components/ui/Public";

export const Doctor = () => {
    return (
        <div>
            <h1>Doctor</h1>
        </div>
    );
};

export default withAuthentication(Doctor, PublicSection);
