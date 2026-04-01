interface Props{
    checked: boolean;
    onChange: (checked: boolean) => void;
}

export default function Checkbox({ checked, onChange } : Props){
    return(
        <input 
            type="checkbox" 
            checked={checked}
            className="
                checkbox
                checked:bg-primary checked:text-primary-content
            "
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => onChange(e.target.checked)}
        >
        </input>
    );
}