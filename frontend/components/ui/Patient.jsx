import withAuthentication from "@/components/auth/withAuthentication";
import { PublicSection } from "@/components/ui/Public";

export const Patient = () => {
    return (
        <div>
            <h1>Patient</h1>
        </div>
    );
};

export default withAuthentication(Patient, PublicSection);
