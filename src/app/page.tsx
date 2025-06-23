"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Brain, UploadCloud, Clapperboard, Sparkles, RotateCw, User, Wand2, AlertTriangle } from 'lucide-react';
import { comparePhotoToCharacters, ComparePhotoToCharactersOutput } from '@/ai/flows/compare-photo-to-characters';
import { searchCharacterInfo, SearchCharacterInfoOutput } from '@/ai/flows/search-character-info';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

type Character = {
  name: string;
  description: string;
  imageDataUri: string;
};

type DisplayResult = {
  resemblanceExplanation: string;
  characterName: string;
  characterImageDataUri: string;
};

const Loader = () => (
  <div className="flex flex-col items-center justify-center gap-4 text-center">
    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary"></div>
    <p className="text-lg font-semibold text-primary font-headline">AI가 분석 중입니다...</p>
    <p className="text-muted-foreground">당신과 가장 닮은 캐릭터를 찾고 있어요. 잠시만 기다려주세요!</p>
  </div>
);

export default function Home() {
  const [characters, setCharacters] = useState<Character[] | null>(null);
  const [characterJsonStringForAi, setCharacterJsonStringForAi] = useState<string>('');
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [aiResult, setAiResult] = useState<DisplayResult | null>(null);
  const [characterInfo, setCharacterInfo] = useState<SearchCharacterInfoOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadCharacterData() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/characters.json');
        if (!response.ok) {
          throw new Error('`public/characters.json` 파일을 찾을 수 없습니다. 파일이 해당 위치에 있는지 확인해주세요.');
        }
        const characterMetadata: Character[] = await response.json();
        setCharacters(characterMetadata);

        const charactersForAi = await Promise.all(
          characterMetadata.map(async (char) => {
            try {
              const imageResponse = await fetch(char.imageDataUri);
              if (!imageResponse.ok) {
                throw new Error(`'${char.name}' 캐릭터의 이미지 ('${char.imageDataUri}')를 불러오는 데 실패했습니다. 파일이 존재하는지 확인해주세요.`);
              }
              const blob = await imageResponse.blob();
              const reader = new FileReader();
              const dataUri = await new Promise<string>((resolve, reject) => {
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
              });
              return { ...char, imageDataUri: dataUri };
            } catch (imageError) {
              const specificError = new Error(`'${char.name}' 캐릭터의 이미지 ('${char.imageDataUri}')를 불러오는 데 실패했습니다. 파일이 존재하는지 확인해주세요.`);
              specificError.cause = imageError;
              throw specificError;
            }
          })
        );
        
        setCharacterJsonStringForAi(JSON.stringify(charactersForAi));

      } catch (e: any) {
        console.error(e);
        setError(e.message);
        setCharacters(null);
      } finally {
        setIsLoading(false);
      }
    }
    loadCharacterData();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUserPhoto(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCompare = async () => {
    if (!userPhoto || !characterJsonStringForAi) {
      setError("사진을 업로드하고 캐릭터 데이터가 준비되어야 합니다.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const comparisonResult: ComparePhotoToCharactersOutput = await comparePhotoToCharacters({
        photoDataUri: userPhoto,
        characterJsonData: characterJsonStringForAi,
      });

      const matchedCharacter = characters?.find(c => c.name === comparisonResult.characterName);

      if (!matchedCharacter) {
        throw new Error(`AI가 반환한 캐릭터("${comparisonResult.characterName}")를 로컬 데이터에서 찾을 수 없습니다.`);
      }

      const resultForDisplay: DisplayResult = {
        resemblanceExplanation: comparisonResult.resemblanceExplanation,
        characterName: matchedCharacter.name,
        characterImageDataUri: matchedCharacter.imageDataUri,
      };

      setAiResult(resultForDisplay);

      const infoResult = await searchCharacterInfo({
        characterName: comparisonResult.characterName,
      });
      setCharacterInfo(infoResult);

    } catch (e: any) {
      console.error(e);
      setError('AI 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      setAiResult(null);
      setCharacterInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setUserPhoto(null);
    setAiResult(null);
    setCharacterInfo(null);
    setError(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };
  
  const renderSetupInstructions = () => (
    <Card className="w-full max-w-2xl mx-auto animate-fade-in">
      <CardHeader>
        <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-destructive"/>
            <CardTitle className="font-headline">앱 설정이 필요합니다</CardTitle>
        </div>
        <CardDescription>앱을 시작하는 데 문제가 발생했습니다.</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>오류 발생</AlertTitle>
          <AlertDescription>
            {error || '알 수 없는 오류가 발생했습니다.'}
          </AlertDescription>
        </Alert>
        <p className="mt-4">
          오류 메시지를 확인하고 문제를 해결해주세요. 보통 `public` 폴더에 `characters.json` 파일이나, 이 파일에 지정된 캐릭터 이미지가 없을 때 발생합니다.
        </p>
        <p className="mt-2">
            `public/characters.json` 파일이 아래와 같은 형식인지, `imageDataUri`에 지정된 이미지 파일이 `public` 폴더 내에 실제로 존재하는지 확인해주세요.
        </p>
        <pre className="mt-4 p-4 rounded-md bg-muted text-muted-foreground overflow-x-auto text-sm">
          <code>
{`[
  {
    "name": "캐릭터 이름",
    "description": "캐릭터에 대한 간단한 설명",
    "imageDataUri": "/character_images/image1.png"
  },
  ...
]`}
          </code>
        </pre>
      </CardContent>
      <CardFooter>
          <p className="text-xs text-muted-foreground">파일을 추가하거나 수정한 후 페이지를 새로고침 해주세요.</p>
      </CardFooter>
    </Card>
  );

  const renderUploader = () => (
    <Card className="w-full max-w-md mx-auto animate-fade-in shadow-lg">
      <CardHeader className="text-center">
        <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
          <User className="w-8 h-8 text-primary"/>
        </div>
        <CardTitle className="font-headline text-2xl mt-2">당신의 사진을 업로드하세요</CardTitle>
        <CardDescription>어떤 이탈리안 브레인롯 캐릭터와 닮았는지 AI가 분석해드립니다.</CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div 
          className="flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg cursor-pointer border-primary/30 hover:bg-primary/5 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          {userPhoto ? (
            <div className="relative w-40 h-40 rounded-full overflow-hidden shadow-md">
              <Image src={userPhoto} alt="업로드된 사진" fill style={{ objectFit: 'cover' }} />
            </div>
          ) : (
            <div className="text-center">
              <UploadCloud className="w-12 h-12 mx-auto text-muted-foreground" />
              <p className="mt-4 text-lg font-semibold">클릭하여 사진 업로드</p>
              <p className="text-sm text-muted-foreground">또는 파일을 여기로 드래그하세요</p>
            </div>
          )}
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
      </CardContent>
      <CardFooter>
        <Button onClick={handleCompare} disabled={!userPhoto || isLoading} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-base py-6">
          <Wand2 className="mr-2 h-5 w-5"/>
          결과 확인하기
        </Button>
      </CardFooter>
    </Card>
  );

  const renderResults = () => (
    <div className="animate-fade-in">
       <Card className="w-full max-w-4xl mx-auto shadow-xl overflow-hidden">
        <CardHeader className="bg-primary/5 p-6">
          <div className="text-center">
            <Badge variant="secondary" className="bg-accent text-accent-foreground">AI 분석 결과</Badge>
            <h2 className="font-headline text-3xl mt-2">당신은 <span className="text-primary">{aiResult?.characterName}</span> 입니다!</h2>
          </div>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="flex flex-col items-center gap-4">
                    <h3 className="font-headline text-xl">당신의 사진</h3>
                    <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden shadow-lg border-4 border-white">
                        <Image src={userPhoto!} alt="사용자 사진" fill style={{ objectFit: 'cover' }} />
                    </div>
                </div>
                <div className="flex flex-col items-center gap-4">
                    <h3 className="font-headline text-xl">닮은 캐릭터</h3>
                    <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden shadow-lg border-4 border-white">
                        <Image src={aiResult!.characterImageDataUri} alt={aiResult!.characterName} fill style={{ objectFit: 'cover' }} data-ai-hint="portrait character"/>
                    </div>
                </div>
            </div>
            
            <Separator className="my-8" />

            <div className="space-y-6">
                <div className="p-6 bg-background rounded-lg border">
                    <h3 className="font-headline text-xl flex items-center gap-2 mb-3"><Sparkles className="text-accent w-6 h-6"/>닮은 이유 (AI 생성)</h3>
                    <p className="text-muted-foreground leading-relaxed">{aiResult?.resemblanceExplanation}</p>
                </div>
                <div className="p-6 bg-background rounded-lg border">
                    <h3 className="font-headline text-xl flex items-center gap-2 mb-3"><Clapperboard className="text-primary w-6 h-6"/>캐릭터 정보 (AI 검색)</h3>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{characterInfo?.characterInfo}</p>
                </div>
            </div>
        </CardContent>
        <CardFooter className="p-6 bg-muted/50">
             <Button onClick={handleReset} className="w-full md:w-auto mx-auto" variant="outline">
                <RotateCw className="mr-2 h-4 w-4" />
                다시 시도하기
            </Button>
        </CardFooter>
       </Card>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="py-6">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-3">
            <Brain className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold font-headline">이탈리안 브레인롯 캐릭터 찾기</h1>
          </div>
          <p className="mt-2 text-lg text-muted-foreground">당신의 숨겨진 캐릭터 본능을 찾아보세요!</p>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center container mx-auto px-4 py-8">
        {isLoading ? <Loader /> : (
            !characters || !characterJsonStringForAi ? renderSetupInstructions() : (
                aiResult ? renderResults() : renderUploader()
            )
        )}
      </main>
      
      <footer className="text-center p-4 text-muted-foreground text-sm">
        <p>Firebase Studio를 사용하여 제작되었습니다.</p>
      </footer>
    </div>
  );
}
