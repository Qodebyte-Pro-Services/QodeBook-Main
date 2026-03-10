import { ReactNode } from "react";
import { IconType } from "react-icons";

type DefaultType = {
    children: ReactNode;
}

type MenuTypes = {
    id: number;
    _path: string;
    _name: string;
    subtext?: string;
    activeIcon: IconType;
    inactiveIcon: IconType;
    isPhoneViewIcon?: IconType;
}

type TransactionTypes = {
    id: number;
    title: string;
    amount: number | string;
    icon: IconType;
    isCurrency?: boolean;
}

type ProductAttribute = {
        attributes:
            Array<{
                id: number;
                business_id: number;
                name: string;
                created_at: string;
                updated_at: string;
                values:
                    Array<{
                        id: number;
                        attribute_id: number;
                        value: string;
                        created_at: string;
                        updated_at: string;
                    }>
            }
        >
}

type ProductAttributeProp = {
    id: number;
    business_id: number;
    name: string;
    created_at: string;
    updated_at: string;
    values:
        Array<{
            id: number;
            attribute_id: number;
            value: string;
            created_at: string;
            updated_at: string;
        }>
}

export {type DefaultType, type MenuTypes, type TransactionTypes, type ProductAttribute, type ProductAttributeProp};