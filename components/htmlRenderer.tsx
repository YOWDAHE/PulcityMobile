import React from "react";
import { ScrollView, useWindowDimensions } from "react-native";
import RenderHTML, {
	HTMLContentModel,
	HTMLElementModel,
} from "react-native-render-html";

const customHTMLElementModels = {
	iframe: HTMLElementModel.fromCustomModel({
		tagName: "iframe",
		contentModel: HTMLContentModel.block,
	}),
};

export const TiptapRenderer = ({ htmlContent }: { htmlContent: any }) => {
	const { width } = useWindowDimensions();

	return (
		<ScrollView>
			<RenderHTML
				contentWidth={width}
				source={{ html: htmlContent }}
				customHTMLElementModels={customHTMLElementModels}
				tagsStyles={{
					p: { fontSize: 16, lineHeight: 20, fontWeight: 'light' },
					strong: { fontWeight: "bold" },
					// Add other styles as needed
				}}
				renderersProps={{
					iframe: {
						scalesPageToFit: true,
						webViewProps: {
							allowsFullscreenVideo: true,
						},
					},
				}}
			/>
		</ScrollView>
	);
};
