import withAuthentication from "@/components/auth/withAuthentication";
import { PublicSection } from "@/components/ui/Public";

const Content = () => {
    return (
        <div>
            <h1>Private</h1>
        </div>
    );
};

export default withAuthentication(Content, PublicSection);
