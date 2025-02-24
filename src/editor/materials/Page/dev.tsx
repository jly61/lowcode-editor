import {CommonComponentProps} from "../../interface";
import {useMaterialDrop} from "../../hooks/useMaterialDrop";

function Page({ id, name, children, styles }: CommonComponentProps) {
	const {canDrop, drop } = useMaterialDrop(['Button', 'Container'], id);

	return (
		<div
			ref={drop}
			data-component-id={id}
			className='p-[20px] h-[100%] box-border'
			style={{ ...styles, border: canDrop ? '2px solid blue' : 'none' }}
		>
			{children}
		</div>
	)
}

export default Page;
