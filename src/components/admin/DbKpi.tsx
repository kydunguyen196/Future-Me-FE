import { DynamicIcon, type IconName } from 'lucide-react/dynamic';

interface DbKpiProps {
  title: string,
  value: number,
  unit?: string,
  color?: string,
  icon?: IconName,
  extra?: any
}

export function DbKpi({title, value, color = "white", unit = "", icon, extra} : DbKpiProps){
  return (<div className={`bg-${color}-100 shadow-(color:--color-${color}-100) rounded-lg shadow-md p-3 flex gap-3 flex-col justify-between`} 
                style={Object({
                  "--tw-shadow-color": `var(--color-${color}-100)`
                })}
            >
          <div className="kpi-main relative">
            <h3 className="text-gray-500 text-left text-sm font-medium leading-10">{title}</h3>
            {icon && (
              <div className="absolute right-1 top-1">
                <DynamicIcon name={icon} color={`var(--color-${color}-400)`} size={32} />
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-2xl font-bold">{value}</span>
              <span className="ml-2 uppercase text-xs text-gray-500">{unit}</span>
            </div>
            <div className="flex items-center text-xs">
              {extra}
            </div>
          </div>
        </div>);
};