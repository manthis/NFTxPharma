import withAuthentication from "@/components/auth/withAuthentication";
import { PublicSection } from "@/components/ui/Public";
import Doctor from "@/components/ui/private/Doctor";
import Patient from "@/components/ui/private/Patient";
import Pharmacy from "@/components/ui/private/Pharmacy";

const PrivateSection = () => {
    return (
        <section className="flex flex-col items-center justify-center w-[90%] min-h-[100svh] pt-20">
            <Patient />
            <Doctor />
            <Pharmacy />
        </section>
    );
};

export default withAuthentication(PrivateSection, PublicSection);
