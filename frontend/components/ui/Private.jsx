import withAuthentication from "@/components/auth/withAuthentication";
import { PublicSection } from "@/components/ui/Public";
import Doctor from "@/components/ui/private/Doctor";
import Patient from "@/components/ui/private/Patient";
import Pharmacy from "@/components/ui/private/Pharmacy";
import { useAuthContext } from "../auth/AuthContext";

const PrivateSection = ({ value }) => {
    const { patient, doctor, pharmacy } = useAuthContext();

    let sectionToDisplay = <PublicSection />;
    if (patient) {
        sectionToDisplay = <Patient />;
    } else if (doctor) {
        sectionToDisplay = <Doctor />;
    } else if (pharmacy) {
        sectionToDisplay = <Pharmacy />;
    }

    return (
        <section className="flex flex-col items-center justify-center w-[90%] min-h-[100svh] pt-20">
            {sectionToDisplay}
        </section>
    );
};

export default withAuthentication(PrivateSection, PublicSection);
