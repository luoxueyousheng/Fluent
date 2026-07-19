/* Form / Form.Item — antd 形态的轻量表单体系(rules 校验)。
 * <Form initialValues onFinish> 里放 <Form.Item name label rules>,
 * Item 自动向唯一子控件注入 value/onChange(valuePropName/getValueFromEvent 可配),
 * 校验失败经 Field 显示错误(WinUI 外观),submit 全量校验后回调 onFinish。 */
import {
  Children, cloneElement, createContext, isValidElement, useCallback, useContext,
  useMemo, useRef, useState, type FormEvent, type ReactElement, type ReactNode,
} from 'react';
import { cn } from '../cn';
import { Field } from './Field';

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface Rule {
  required?: boolean;
  min?: number;               // 字符串最短长度 / 数字最小值
  max?: number;
  pattern?: RegExp;
  validator?: (value: any) => string | undefined | Promise<string | undefined>;
  message?: string;
}

async function runRules(value: any, rules: Rule[]): Promise<string | undefined> {
  for (const r of rules) {
    const empty = value == null || value === '' || (Array.isArray(value) && !value.length);
    if (r.required && empty) return r.message ?? '此项必填';
    if (empty) continue;
    if (typeof value === 'number') {
      if (r.min != null && value < r.min) return r.message ?? `不能小于 ${r.min}`;
      if (r.max != null && value > r.max) return r.message ?? `不能大于 ${r.max}`;
    } else if (typeof value === 'string') {
      if (r.min != null && value.length < r.min) return r.message ?? `至少 ${r.min} 个字符`;
      if (r.max != null && value.length > r.max) return r.message ?? `最多 ${r.max} 个字符`;
      if (r.pattern && !r.pattern.test(value)) return r.message ?? '格式不正确';
    }
    if (r.validator) {
      const err = await r.validator(value);
      if (err) return err;
    }
  }
  return undefined;
}

interface FormStore {
  get: (name: string) => any;
  set: (name: string, v: any) => void;
  error: (name: string) => string | undefined;
  registerRules: (name: string, rules: Rule[]) => void;
  validateField: (name: string) => Promise<string | undefined>;
}

const FormCtx = createContext<FormStore | null>(null);

export interface FormProps {
  initialValues?: Record<string, any>;
  onFinish?: (values: Record<string, any>) => void;
  onFinishFailed?: (errors: Record<string, string>) => void;
  children: ReactNode;
  className?: string;
}

export function Form({ initialValues = {}, onFinish, onFinishFailed, children, className }: FormProps) {
  const values = useRef<Record<string, any>>({ ...initialValues });
  const rulesMap = useRef<Record<string, Rule[]>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [, force] = useState(0);

  const store = useMemo<FormStore>(() => ({
    get: (name) => values.current[name],
    set: (name, v) => { values.current[name] = v; force((x) => x + 1); },
    error: (name) => errors[name],
    registerRules: (name, rules) => { rulesMap.current[name] = rules; },
    validateField: async (name) => {
      const err = await runRules(values.current[name], rulesMap.current[name] ?? []);
      setErrors((e) => {
        if (err) return { ...e, [name]: err };
        const { [name]: _drop, ...rest } = e;
        return rest;
      });
      return err;
    },
  }), [errors]);

  const submit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    for (const name of Object.keys(rulesMap.current)) {
      const err = await runRules(values.current[name], rulesMap.current[name]);
      if (err) errs[name] = err;
    }
    setErrors(errs);
    if (Object.keys(errs).length) onFinishFailed?.(errs);
    else onFinish?.({ ...values.current });
  }, [onFinish, onFinishFailed]);

  return (
    <FormCtx.Provider value={store}>
      <form className={cn('form', className)} noValidate onSubmit={submit}>{children}</form>
    </FormCtx.Provider>
  );
}

export interface FormItemProps {
  name: string;
  label?: string;
  rules?: Rule[];
  hint?: string;
  /** 子控件的取值 prop 名(默认 value;Switch/Checkbox 用 checked) */
  valuePropName?: string;
  /** 从 onChange 参数取值(默认:事件取 target.value/checked,否则原样) */
  getValueFromEvent?: (...args: any[]) => any;
  children: ReactElement;
  className?: string;
}

function defaultGetValue(arg: any): any {
  if (arg && typeof arg === 'object' && 'target' in arg) {
    const t = arg.target as HTMLInputElement;
    return t.type === 'checkbox' ? t.checked : t.value;
  }
  return arg;
}

function FormItem({
  name, label, rules = [], hint, valuePropName = 'value',
  getValueFromEvent = defaultGetValue, children, className,
}: FormItemProps) {
  const store = useContext(FormCtx);
  if (!store) throw new Error('Form.Item 需在 <Form> 内使用');
  store.registerRules(name, rules);
  const err = store.error(name);
  const child = Children.only(children);
  if (!isValidElement(child)) throw new Error('Form.Item 需要唯一的元素子节点');

  const childProps = child.props as Record<string, any>;
  const injected = cloneElement(child as ReactElement<any>, {
    [valuePropName]: store.get(name) ?? childProps[valuePropName] ?? (valuePropName === 'checked' ? false : ''),
    onChange: (...args: any[]) => {
      store.set(name, getValueFromEvent(...args));
      childProps.onChange?.(...args);
      void store.validateField(name);      // antd 默认 validateTrigger=onChange
    },
  });

  const required = rules.some((r) => r.required);
  return (
    <Field className={cn(required && 'field-required', className)} label={label} hint={hint}
           validation={err ? { state: 'error', message: err } : null}>
      {injected}
    </Field>
  );
}

Form.Item = FormItem;
