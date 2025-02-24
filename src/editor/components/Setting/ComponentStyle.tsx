import { Form, Input, InputNumber, Select } from 'antd';
import {CSSProperties, useEffect, useState} from 'react';
import { ComponentSetter, useComponentConfigStore } from '../../stores/component-config';
import { useComponetsStore } from '../../stores/components';
import CssEditor from "./CssEditor";
import {debounce} from "lodash-es";
import styleToObject from 'style-to-object'

export function ComponentStyle() {

	const [form] = Form.useForm();

	const { curComponentId, curComponent, updateComponentStyles } = useComponetsStore();
	const { componentConfig } = useComponentConfigStore();
	const [css, setCss] = useState<string>(`.comp{\n\n}`);

	useEffect(() => {
		form.resetFields()

		const data = form.getFieldsValue();
		form.setFieldsValue({...data, ...curComponent?.styles});

		setCss(toCSSStr(curComponent?.styles!))
	}, [curComponent])

	if (!curComponentId || !curComponent) return null;

	function toCSSStr(css: Record<string, any>) {
		let str = `.comp {\n`;
		for(let key in css) {
			let value = css[key];
			if(!value) {
				continue;
			}
			if(['width', 'height'].includes(key) &&  !value.toString().endsWith('px')) {
				value += 'px';
			}

			key = key.replace(/[A-Z]/g, (match) => "-" + match.toLowerCase());
			str += `\t${key}: ${value};\n`
		}
		str += `}`;
		return str;
	}

	function renderFormElememt(setting: ComponentSetter) {
		const { type, options } = setting;

		if (type === 'select') {
			return <Select options={options} />
		} else if (type === 'input') {
			return <Input />
		} else if (type === 'inputNumber') {
			return <InputNumber />
		}
	}

	function valueChange(changeValues: CSSProperties) {
		if (curComponentId) {
			updateComponentStyles(curComponentId, changeValues);
		}
	}

	const handlerEditorChange = debounce((value) => {
		setCss(value);

		let css: Record<string, any> = {};

		try {
			const cssStr = value.replace(/\/\*.*\*\//, '') // 去掉注释 /** */
				.replace(/(\.?[^{]+{)/, '') // 去掉 .comp {
				.replace('}', '');// 去掉 }

			styleToObject(cssStr, (name, value) => {
				console.log('name', name, value)
				css[name.replace(/-\w/, (item) => {
					console.log('item', item)
					return item.toUpperCase().replace('-', '')
				})] = value;
			});

			updateComponentStyles(curComponentId, {...form.getFieldsValue(), ...css}, true);
		} catch(e) {}
	}, 500);


	return (
		<Form
			form={form}
			onValuesChange={valueChange}
			labelCol={{ span: 8 }}
			wrapperCol={{ span: 14 }}
		>
			{
				componentConfig[curComponent.name]?.stylesSetter?.map(setter => (
					<Form.Item key={setter.name} name={setter.name} label={setter.label}>
						{renderFormElememt(setter)}
					</Form.Item>
				))
			}
			<div className='h-[200px] border-[1px] border-[#ccc]'>
				<CssEditor value={css} onChange={handlerEditorChange} />
			</div>
		</Form>
	)
}
