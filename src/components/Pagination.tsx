import { Input } from "./ui/input";
import { memo, useEffect, useState } from "react";
import { Select, SelectTrigger, SelectValue } from "@radix-ui/react-select";
import { SelectContent, SelectItem } from "./ui/select";
import { useTranslation } from "react-i18next";
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight } from "lucide-react";

export type ItemPerPage = "20" | "50" | "70" | "100";

const IppOptions: { value: ItemPerPage }[] = [
    { value: "20" },
    { value: "50" },
    { value: "70" },
    { value: "100" },
];

export interface PaginationProps {
    page: number,
    ipp: ItemPerPage,
    total: number,
    handle?: (page: number, ipp: ItemPerPage) => any
};

function Pagination({ page, ipp, total, handle }: PaginationProps) {
    const { t } = useTranslation();
    const [current, setCurrent] = useState(page);
    const [currentIpp, setCurrentIpp] = useState(ipp);

    useEffect(() => {
        handle?.(current, currentIpp);
    }, [current, currentIpp]);

    const handleNextPage = () => {
        if (current < getTotalPages()) {
            setCurrent(prev => prev + 1);
        }
    }

    const handlePrevPage = () => {
        if (current > 1) {
            setCurrent(prev => prev - 1);
        }
    }

    const handleChangePage = (newPage: number | string) => {
        const pageNum = typeof newPage === 'string' ? parseInt(newPage, 10) : newPage;
        let finalPage = pageNum;
        
        if (finalPage < 1) {
            finalPage = 1;
        } else if (finalPage > getTotalPages()) {
            finalPage = getTotalPages();
        }

        setCurrent(finalPage);
    }

    const handleChangeIpp = (newIpp: ItemPerPage) => {
        setCurrentIpp(newIpp);
        setCurrent(1);
    };

    const getTotalPages = () => {
        return Math.ceil(total / parseInt(currentIpp));
    }

    return (<div className="flex gap-2">
        <Select
            value={`${currentIpp}`}
            onValueChange={handleChangeIpp}
        >
            <SelectTrigger className="border border-gray-200! h-9 leading-0 focus:outline-none!">
                <SelectValue className="absolute" placeholder={t('common.paginate')} />
            </SelectTrigger>
            <SelectContent>
                {IppOptions.map(option => <SelectItem key={option.value} value={option.value} className="text-base py-2 cursor-pointer data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700">{option.value} {t("common.ipp")}</SelectItem>)}
            </SelectContent>
        </Select>
        <div className="p-2 border select-none border-gray rounded-xl cursor-pointer text-gray-500 hover:text-blue-400 hover:border-blue-400 hover:shadow-md"
            onClick={() => handleChangePage(1)}
        >
            <ChevronFirst size={20} />
        </div>
        <div className="p-2 border select-none border-gray rounded-xl cursor-pointer text-gray-500 hover:text-blue-400 hover:border-blue-400 hover:shadow-md"
            onClick={handlePrevPage}
        >
            <ChevronLeft size={20} />
        </div>
        <Input className="w-16" type="number" value={current} onInput={(ev) => handleChangePage((ev.target as HTMLInputElement).value)} />
        <div className="p-2 border select-none border-gray rounded-xl cursor-pointer text-gray-500 hover:text-blue-400 hover:border-blue-400 hover:shadow-md"
            onClick={handleNextPage}
        >
            <ChevronRight size={20} />
        </div>
        <div className="p-2 border select-none border-gray rounded-xl cursor-pointer text-gray-500 hover:text-blue-400 hover:border-blue-400 hover:shadow-md"
            onClick={() => handleChangePage(getTotalPages())}
        >
            <ChevronLast size={20} />
        </div>
    </div>)
}

export default memo(Pagination);