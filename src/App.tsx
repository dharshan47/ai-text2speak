import { useEffect, useState } from "react";
import puter from "@heyputer/puter.js";

const App = () => {
  const [aiReady, setAiReady] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(
    null
  );

  useEffect(() => {
    const checkReady = setInterval(() => {
      if (puter && puter.ai && typeof puter.ai.chat === "function") {
        setAiReady(true);
        clearInterval(checkReady);
      }
    }, 300);
    return () => clearInterval(checkReady);
  }, []);

  const speakText = async () => {
    if (!text.trim()) return;
    if (text.length > 3000) {
      setError("Text must be less than 3000 characters");
      return;
    }
    setLoading(true);
    setError("");

    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    try {
      const audio = await puter.ai.txt2speech!(text, {
        engine: "standard",
        language: "en-US",
      });

      if (audio) {
        setCurrentAudio(audio);
        await audio.play();

        audio.addEventListener("ended", () => setLoading(false), {
          once: true,
        });
        audio.addEventListener("error", () => setLoading(false), {
          once: true,
        });
      } else {
        setError("Failed to generate audio.");
        setLoading(false);
      }
    } catch (err) {
      if (err instanceof Error) setError(err.message || "Something went wrong");
      setLoading(false);
    }
  };

  const stopSpeak = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-950 via-slate-950 to-purple-900 flex flex-col justify-center items-center p-3 gap-6 ">
      <h1 className="text-6xl sm:text-7xl md:text-8xl bg-gradient-to-r from-blue-500 via-rose-500 to-indigo-500 font-semibold bg-clip-text text-transparent text-center">
        AI Text to Speech
      </h1>
      <div
        className={`px-4 py-2 rounded-full text-sm font-medium ${
          aiReady
            ? "bg-green-500/20 text-green-300 border border-green-500/30"
            : "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
        }`}
      >
        {aiReady ? "🟢 AI Ready" : "🟡 Waiting for AI..."}
      </div>
      
      <div className="w-full max-w-2xl bg-gradient-to-r from-gray-800/90 to-gray-700/90 backdrop-blur-md border border-gray-600 rounded-3xl p-6">
        <textarea
          className="w-full h-40 p-4 bg-gray-700/80 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400 resize-none transition duration-200 rounded-2xl shadow-xl hover:shadow-fuchsia-700/70"
          placeholder="Enter text to convert to speech... (max 3000 Characters)"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={!aiReady}
          maxLength={3000}
        />
        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-gray-400">
            {text.length}/3000 characters
          </span>
        </div>


        <div className="flex gap-3 mt-4">
          <button
            className="flex-1 px-6 py-3 bg-gradient-to-r from-rose-500 to-purple-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-2xl hover:opacity-80 disabled:opacity-50 border border-gray-600 transition duration-300 cursor-pointer disabled:cursor-not-allowed"
            onClick={speakText}
            disabled={!aiReady || loading || !text.trim()}
          >
            {loading ? (
              <div className="flex justify-center items-center gap-2">
                <div className="h-4 w-4 animate-spin border-2 border-white/30 border-t-white rounded-full"></div>
                Speaking...
              </div>
            ) : (
              <div className="flex justify-center items-center gap-2 cursor-pointer">
                🔊 Speak
              </div>
            )}
          </button>

          {currentAudio && (
            <button
              className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700  text-white font-semibold rounded-2xl shadow-lg  hover:opacity-80 border border-neutral-500/30 transition duration-300 cursor-pointer  "
              onClick={stopSpeak}
            >
              ⏹ Stop
            </button>
          )}
        </div>
      </div>
      <div className="space-y-4 text-white mt-6">
        {error && (
          <div className="p-4 bg-red-100 text-red-500 border border-red-300 rounded-2xl">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
