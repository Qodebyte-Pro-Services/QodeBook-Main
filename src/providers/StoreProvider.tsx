import { Provider } from "react-redux";
import storeConfig from "@/store/config/store-config";
import { DefaultType } from "@/models/types/shared/project-type";

const StoreProviders = ({children}: DefaultType) => {
    return(
        <Provider store={storeConfig}>
            {children}
        </Provider>
    );
}

export default StoreProviders;