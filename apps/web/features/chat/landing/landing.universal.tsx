import { Sparkle } from "lucide-react";
import type { ReactNode } from "react";

export function ChatLanding({
	referralSlot,
	chatButtonSlot,
}: {
	referralSlot: ReactNode;
	chatButtonSlot: ReactNode;
}) {
	return (
		<div className="flex flex-col gap-6 sm:gap-10 [animation:fade-up_0.9s_ease-out_both]">
			<style>{`
				@keyframes fade-up {
					from { opacity: 0; transform: translateY(8px); }
					to { opacity: 1; transform: translateY(0); }
				}
				@keyframes shimmer {
					0%, 100% { opacity: 0.45; }
					50% { opacity: 0.85; }
				}
			`}</style>

			<header className="flex flex-col items-center gap-4 pt-2 text-center sm:gap-6">
				<div className="flex items-center gap-3">
					<span className="h-px w-8 bg-gradient-to-r from-transparent to-[#A07F40] sm:w-10" />
					<Sparkle
						className="size-3 text-[#A07F40] sm:size-3.5"
						style={{ animation: "shimmer 4s ease-in-out infinite" }}
					/>
					<span className="h-px w-8 bg-gradient-to-l from-transparent to-[#A07F40] sm:w-10" />
				</div>
				<p className="font-[family-name:var(--font-mincho)] text-[0.6rem] tracking-[0.28em] text-[#4A4640] sm:text-xs sm:tracking-[0.45em]">
					O M I O K U R I &nbsp;・&nbsp; S U P P O R T
				</p>
				<h1 className="font-[family-name:var(--font-mincho)] text-[1.55rem] font-medium leading-[1.65] tracking-[0.04em] text-[#1F1B17] sm:text-[2.1rem] sm:tracking-wider md:text-[2.6rem]">
					大切な方を想う、
					<br />
					その一歩に寄り添う。
				</h1>
				<p className="max-w-md font-[family-name:var(--font-sans-jp)] text-[0.82rem] leading-[1.95] text-[#3A3530] sm:text-sm sm:leading-[2.1]">
					お見送りサポートチャットへ、ようこそ。
					<br />
					終活のご準備から、ご逝去のときの諸手続き、
					<br className="hidden sm:inline" />
					ご相続、そしてその後の暮らしまで。
					<br />
					AI コンシェルジュが、静かに整理のお手伝いをいたします。
				</p>
			</header>

			<section className="relative">
				<div
					aria-hidden
					className="absolute -inset-px rounded-[2px] bg-gradient-to-br from-[#C9A961] via-transparent to-[#C9A961]"
				/>
				<div className="relative flex flex-col gap-6 bg-[#FFFDF8] px-5 py-8 shadow-[0_2px_24px_rgba(74,58,31,0.06)] backdrop-blur-sm sm:gap-8 sm:px-10 sm:py-12">
					<CornerMark
						className="absolute left-2 top-2 sm:left-3 sm:top-3"
						placement="tl"
					/>
					<CornerMark
						className="absolute right-2 top-2 sm:right-3 sm:top-3"
						placement="tr"
					/>
					<CornerMark
						className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3"
						placement="bl"
					/>
					<CornerMark
						className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3"
						placement="br"
					/>

					{referralSlot}

					<div className="flex flex-col gap-3">
						<h2 className="font-[family-name:var(--font-mincho)] text-base text-[#1F1B17]">
							ご相談できること
						</h2>
						<ul className="grid gap-2.5 text-sm text-[#3A3530]">
							{[
								"終活のご準備、おひとりの場合のお備え",
								"ご逝去時の諸手続き、葬儀・行政等のご対応",
								"ご相続のご整理、関係者へのご連絡",
								"ご相続後の暮らし・資産のご活用",
							].map((item) => (
								<li className="flex items-start gap-3" key={item}>
									<span className="mt-2 h-px w-3 shrink-0 bg-[#A07F40]" />
									<span className="leading-relaxed">{item}</span>
								</li>
							))}
						</ul>
					</div>

					<div className="relative overflow-hidden rounded-sm bg-[#F5EAD3]/70 px-5 py-4 text-[0.78rem] leading-[1.9] text-[#4A3A1F]">
						<div className="absolute left-0 top-0 h-full w-[2px] bg-gradient-to-b from-[#A07F40] via-[#C97E70] to-[#A07F40]" />
						<p className="mb-2">
							本サービスは主に
							<span className="font-medium text-[#1F1B17]">
								千葉県にお住まいの方
							</span>
							を対象としています。
						</p>
						<p>
							お話の中では、氏名・ご住所・お電話番号・口座情報など
							<span className="font-medium text-[#1F1B17]">
								個人を特定できる情報
							</span>
							のご入力はお控えくださいませ。
						</p>
					</div>

					<div className="flex flex-col items-center gap-4 pt-2">
						{chatButtonSlot}
						<p className="text-center text-[0.72rem] leading-relaxed text-[#5C5852]">
							お渡しするチャット URL より、いつでも続きから
							<br className="sm:hidden" />
							ご相談いただけます。
							<br />
							（最終ご利用より 1 週間で公開アクセスは閉じられます）
						</p>
					</div>
				</div>
			</section>

			<footer className="flex items-center justify-center gap-3 pb-4">
				<span className="h-px w-6 bg-[#A07F40]/70" />
				<span className="font-[family-name:var(--font-mincho)] text-[0.7rem] tracking-[0.4em] text-[#5C5852]">
					しずかに、ともに
				</span>
				<span className="h-px w-6 bg-[#A07F40]/70" />
			</footer>
		</div>
	);
}

function CornerMark({
	className,
	placement,
}: {
	className?: string;
	placement: "tl" | "tr" | "bl" | "br";
}) {
	const lines: Record<typeof placement, string> = {
		bl: "border-b border-l",
		br: "border-b border-r",
		tl: "border-l border-t",
		tr: "border-r border-t",
	};
	return (
		<span
			aria-hidden
			className={`size-3 border-[#A07F40]/80 sm:size-4 ${lines[placement]} ${className ?? ""}`}
		/>
	);
}
