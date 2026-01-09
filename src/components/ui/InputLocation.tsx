import { Label } from "@/components/ui/label";
import { Select, SelectTrigger } from "@radix-ui/react-select";
import { SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { memo, useEffect, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { ChevronDown, Info } from "lucide-react";
import { Skeleton } from "./skeleton";


/**
 * @desc Static store for VN provinces
 */
let provinces: Provice[];

interface Ward {
    id: string,
    full_name: string,
    full_name_en: string,
    latitude: string,
    longitude: string,
    name: string,
    name_en: string
}

interface District {
    id: string,
    full_name: string,
    full_name_en: string,
    latitude: string,
    longitude: string,
    name: string,
    name_en: string,
    wards: Ward[]
}

interface Provice {
    id: string,
    full_name: string,
    full_name_en: string,
    latitude: string,
    longitude: string,
    name: string,
    name_en: string,
    districts: District[]
}

export interface LocationValue {
    province: string,
    district: string,
    ward: string
}

const Location = {
    provinces: async (): Promise<Provice[]> => {
        if (!provinces) {
            let response = await axios.get("https://esgoo.net/api-tinhthanh/4/0.htm");
            let data = response.data?.data ?? [];

            provinces = [];
            for (let i = 0; i < data.length; i++) {
                let province = data[i];

                province.districts = province.data2 ?? [];

                delete province.data2;

                for (let j = 0; j < province.districts.length; j++) {
                    province.districts[j].wards = province.districts[j].data3;
                    delete province.districts[j].data3;
                }

                provinces.push(province);
            }
        }

        return Promise.resolve(provinces);
    },
    province: async (id: string): Promise<Provice | undefined> => {
        return (await Location.provinces()).find(province => province.id == id);
    },
    district: async (province_id: string, id: string): Promise<District | undefined> => {
        return (await Location.province(province_id))?.districts.find(district => district?.id == id);
    }
};

interface InputLocationProps {
    obj: any,
    readonly?: boolean,
    onChange?: Function,
    disableInternalSkeleton?: boolean
}

function InputLocation({ obj, readonly, onChange, disableInternalSkeleton }: InputLocationProps) {
    const { t } = useTranslation();
    const [data, setData] = useState({
        province: obj?.province ?? "",
        district: obj?.district ?? "",
        ward: obj?.ward ?? "",
    });
    const [provinces, setProvinces] = useState<Provice[]>([]);
    const [validDistricts, setValidDistricts] = useState<District[]>([]);
    const [validWards, setValidWards] = useState<Ward[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        Location.provinces().then(provinces => {
            setProvinces(provinces);
            if (!data.province) {
                return setIsLoading(false);
            }

            Location.province(data.province).then(location => {
                setValidDistricts(location?.districts ?? []);
                if (!data.district) {
                    return setIsLoading(false);
                }
                return Location.district(data.province, data.district).then(district => {
                    setValidWards(district?.wards ?? []);
                    setIsLoading(false);
                })
            });
        }).catch(() => {
            setIsLoading(false);
            setIsError(true);
        });
    }, []);

    useEffect(() => {
        onChange?.(data);
    }, [data]);

    const handleChangeProvince = (id: string) => {
        Location.province(id).then(province => {
            const newData = { 
                province: province?.id || "", 
                district: "", 
                ward: "" 
            };
            setData(newData);
            setValidDistricts(province?.districts ?? []);
            setValidWards([]);
        });
    };

    const handleChangeDistrict = (id: string) => {
        Location.district(data.province, id).then(district => {
            const newData = { 
                ...data, 
                district: district?.id || "", 
                ward: "" 
            };
            setData(newData);
            setValidWards(district?.wards ?? []);
        });
    };

    const handleChangeWard = (id: string) => {
        setData(prev => ({ ...prev, ward: id }));
    };

    if (isLoading && !disableInternalSkeleton) {
        return <Skeleton className="h-8 w-full" />
    }

    if (isError) {
        return <div>
            <Info color="red" />
            <div>{t('register.errors.provinceLoad')}</div>
        </div>
    }

    if (readonly){
        let province = provinces.find(item => item.id == obj.province);
        
        if (!province){
            return t("common.notProvided");
        }

        let district = validDistricts.find(item => item.id == obj.district);

        if (!district){
            return province.full_name;
        }

        
        let ward = validWards.find(item => item.id == obj.ward);

        if (!ward){
            return `${district.full_name}, ${province.full_name}`;
        }

        return `${ward.full_name}, ${district.full_name}, ${province.full_name}`;
    }

    return (<div>
        {/* Location fields */}
        <div className="grid grid-cols-3 md:grid-cols-3 gap-3">
            <div className="flex gap-2 flex-col">
                <Label htmlFor="province" className="text-base font-medium">{t("register.province")}</Label>
                <Select
                    value={data.province}
                    onValueChange={handleChangeProvince}
                >
                    <SelectTrigger className="relative border border-gray-200! h-9 leading-0 text-left w-full">
                        <SelectValue className="text-normal" placeholder={t("register.provincePlaceholder")} /> <ChevronDown className="absolute right-2 top-1.5" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                        {provinces.map((province) => (
                            <SelectItem key={province.id} value={province.id} className="text-base py-2">
                                {province.full_name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex gap-2 flex-col">
                <Label htmlFor="district" className="text-base font-medium">{t("register.district")}</Label>
                <Select
                    value={data.district}
                    onValueChange={handleChangeDistrict}
                    disabled={!data.province}
                >
                    <SelectTrigger className="relative border border-gray-200! h-9 leading-0 text-left w-full">
                        <SelectValue className="text-normal" placeholder={t("register.districtPlaceholder")} /> <ChevronDown className="absolute right-2 top-1.5" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                        {validDistricts?.map((district) => (
                            <SelectItem key={district.id} value={district.id} className="text-base py-2">
                                {district.full_name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex gap-2 flex-col">
                <Label htmlFor="ward" className="text-base font-medium">{t("register.ward")}</Label>
                <Select
                    value={data.ward}
                    onValueChange={handleChangeWard}
                    disabled={!data.district}
                >

                    <SelectTrigger className="relative border border-gray-200! h-9 leading-0 text-left w-full">
                        <SelectValue className="text-normal" placeholder={t("register.wardPlaceholder")} /> <ChevronDown className="absolute right-2 top-1.5" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                        {validWards.map((ward) => (
                            <SelectItem key={ward.id} value={ward.id} className="text-base py-2">
                                {ward.full_name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    </div>)
};


export default memo(InputLocation);