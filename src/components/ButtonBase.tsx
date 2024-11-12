import style from './styles/ButtonBase.module.css';

type AnchorProps = React.AnchorHTMLAttributes<HTMLElement>
type ButtonProps = React.ButtonHTMLAttributes<HTMLElement>
type MyButtonProps = AnchorProps | ButtonProps

function isAnchor(props: MyButtonProps): props is AnchorProps {
  return (props as AnchorProps).href !== undefined;
}

export function ButtonBase(props: MyButtonProps) {
	return (
		(isAnchor(props)) ?
		<a className={style.buttonBase} {...props} />
		:
		<button type="button" className={style.buttonBase} {...props} />
	);
}

export default ButtonBase;
