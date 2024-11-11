import { IoSettingsSharp } from "react-icons/io5";
import style from "./styles/Header.module.css";

function Header() {

	return (
		<div className={style.container}>
			<p className={style.title}>Cycle Combo</p>
			<div className={style.setting}>
				<IoSettingsSharp className={style.settingIcon} size={24} />
			</div>
		</div>
	);
}

export default Header;
